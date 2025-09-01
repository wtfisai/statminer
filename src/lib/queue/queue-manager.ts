import Bull from 'bull';
import { QueuedJob } from '@/types';
import { sendToLLMProviders } from '@/lib/llm-providers';
import SessionManager from '@/lib/auth/session-manager';

interface QueueConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions?: Bull.JobOptions;
  concurrency?: number;
}

class QueueManager {
  private static instance: QueueManager;
  private queues: Map<string, Bull.Queue> = new Map();
  private sessionManager: SessionManager;

  private constructor(config?: QueueConfig) {
    this.sessionManager = SessionManager.getInstance();
    
    // Initialize queues
    this.initializeQueues(config);
  }

  static getInstance(config?: QueueConfig): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager(config);
    }
    return QueueManager.instance;
  }

  private initializeQueues(config?: QueueConfig) {
    const redisConfig = config?.redis || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    };

    // Chat queue for LLM requests
    const chatQueue = new Bull('chat-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Database query queue
    const databaseQueue = new Bull('database-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      },
    });

    // Neo4j operations queue
    const neo4jQueue = new Bull('neo4j-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    // Analytics events queue
    const analyticsQueue = new Bull('analytics-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 10,
        attempts: 1,
      },
    });

    // Register queues
    this.queues.set('chat', chatQueue);
    this.queues.set('database', databaseQueue);
    this.queues.set('neo4j', neo4jQueue);
    this.queues.set('analytics', analyticsQueue);

    // Setup processors
    this.setupProcessors(config?.concurrency || 5);
  }

  private setupProcessors(concurrency: number) {
    // Chat queue processor
    const chatQueue = this.queues.get('chat')!;
    chatQueue.process(concurrency, async (job) => {
      const { message, providers, sessionId } = job.data;
      
      console.log(`Processing chat job ${job.id} for session ${sessionId}`);
      
      try {
        // Update job progress
        await job.progress(10);
        
        // Get session API keys if available
        const session = this.sessionManager.getSession(sessionId);
        
        // Send to LLM providers
        const responses = await sendToLLMProviders(message, providers);
        
        await job.progress(90);
        
        // Track API usage
        if (session) {
          for (const response of responses) {
            this.sessionManager.updateApiUsage(
              sessionId,
              response.providerId,
              response.metadata.tokensUsed,
              response.metadata.cost
            );
          }
        }
        
        await job.progress(100);
        
        return { success: true, responses };
      } catch (error) {
        console.error(`Chat job ${job.id} failed:`, error);
        throw error;
      }
    });

    // Database queue processor
    const databaseQueue = this.queues.get('database')!;
    databaseQueue.process(concurrency, async (job) => {
      const { databaseId, query, parameters } = job.data;
      
      console.log(`Processing database query job ${job.id} for ${databaseId}`);
      
      try {
        await job.progress(10);
        
        // Execute database query
        // Implementation depends on specific database connector
        const result = await this.executeDatabaseQuery(databaseId, query, parameters);
        
        await job.progress(100);
        
        return { success: true, result };
      } catch (error) {
        console.error(`Database job ${job.id} failed:`, error);
        throw error;
      }
    });

    // Neo4j queue processor
    const neo4jQueue = this.queues.get('neo4j')!;
    neo4jQueue.process(Math.floor(concurrency / 2), async (job) => {
      const { operation, params } = job.data;
      
      console.log(`Processing Neo4j job ${job.id}: ${operation}`);
      
      try {
        await job.progress(10);
        
        // Execute Neo4j operation
        const result = await this.executeNeo4jOperation(operation, params);
        
        await job.progress(100);
        
        return { success: true, result };
      } catch (error) {
        console.error(`Neo4j job ${job.id} failed:`, error);
        throw error;
      }
    });

    // Analytics queue processor
    const analyticsQueue = this.queues.get('analytics')!;
    analyticsQueue.process(concurrency * 2, async (job) => {
      const { event, properties } = job.data;
      
      console.log(`Processing analytics event: ${event}`);
      
      try {
        // Send to analytics service
        await this.sendAnalyticsEvent(event, properties);
        
        return { success: true };
      } catch (error) {
        console.error(`Analytics job ${job.id} failed:`, error);
        // Don't throw for analytics failures
        return { success: false, error: error.message };
      }
    });
  }

  // Add job to queue
  async addJob(
    queueName: string,
    data: any,
    options?: Bull.JobOptions
  ): Promise<Bull.Job> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobOptions: Bull.JobOptions = {
      ...options,
      timestamp: Date.now(),
    };

    // Assign priority based on job type
    if (!jobOptions.priority) {
      switch (queueName) {
        case 'chat':
          jobOptions.priority = 1; // Highest priority
          break;
        case 'database':
          jobOptions.priority = 2;
          break;
        case 'neo4j':
          jobOptions.priority = 3;
          break;
        case 'analytics':
          jobOptions.priority = 5; // Lowest priority
          break;
      }
    }

    return await queue.add(data, jobOptions);
  }

  // Add bulk jobs
  async addBulkJobs(
    queueName: string,
    jobs: Array<{ data: any; opts?: Bull.JobOptions }>
  ): Promise<Bull.Job[]> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.addBulk(jobs);
  }

  // Get job by ID
  async getJob(queueName: string, jobId: string): Promise<Bull.Job | null> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.getJob(jobId);
  }

  // Get queue status
  async getQueueStatus(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed, isPaused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: isPaused,
    };
  }

  // Get all queue statuses
  async getAllQueueStatuses(): Promise<Map<string, any>> {
    const statuses = new Map();
    
    for (const [name, queue] of this.queues) {
      statuses.set(name, await this.getQueueStatus(name));
    }
    
    return statuses;
  }

  // Pause queue
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
  }

  // Resume queue
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
  }

  // Clean queue
  async cleanQueue(
    queueName: string,
    grace: number = 0,
    status?: 'completed' | 'wait' | 'active' | 'delayed' | 'failed'
  ): Promise<Bull.Job[]> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.clean(grace, status);
  }

  // Retry failed jobs
  async retryFailedJobs(queueName: string): Promise<number> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const failedJobs = await queue.getFailed();
    let retryCount = 0;

    for (const job of failedJobs) {
      await job.retry();
      retryCount++;
    }

    return retryCount;
  }

  // Helper methods for processors
  private async executeDatabaseQuery(
    databaseId: string,
    query: string,
    parameters: any
  ): Promise<any> {
    // Implement database query execution
    // This would connect to the appropriate database and execute the query
    console.log(`Executing query on ${databaseId}:`, query);
    return { mock: 'result' };
  }

  private async executeNeo4jOperation(
    operation: string,
    params: any
  ): Promise<any> {
    // Implement Neo4j operation execution
    console.log(`Executing Neo4j operation: ${operation}`);
    return { mock: 'result' };
  }

  private async sendAnalyticsEvent(
    event: string,
    properties: any
  ): Promise<void> {
    // Send to Vercel Analytics or other analytics service
    console.log(`Analytics event: ${event}`, properties);
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down queue manager...');
    
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`Queue ${name} closed`);
    }
  }

  // Event listeners for monitoring
  setupEventListeners() {
    for (const [name, queue] of this.queues) {
      queue.on('completed', (job, result) => {
        console.log(`Job ${job.id} in ${name} completed:`, result);
      });

      queue.on('failed', (job, err) => {
        console.error(`Job ${job.id} in ${name} failed:`, err);
      });

      queue.on('stalled', (job) => {
        console.warn(`Job ${job.id} in ${name} stalled`);
      });

      queue.on('error', (error) => {
        console.error(`Queue ${name} error:`, error);
      });
    }
  }
}

export default QueueManager;