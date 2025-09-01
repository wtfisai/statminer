import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as cors from 'cors';
import * as express from 'express';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const storage = getStorage();
const corsHandler = cors({ origin: true });

// Express app for API routes
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Chat API endpoint - proxy to LLM providers
app.post('/chat', async (req, res) => {
  try {
    const { message, providers, sessionId } = req.body;
    
    // Validate user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // Forward to LLM providers
    const responses = await forwardToLLMProviders(message, providers);
    
    // Save to Firestore
    if (sessionId) {
      await saveChatMessage(sessionId, message, responses);
    }
    
    res.json({ success: true, responses });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook processing endpoint
app.post('/webhooks', async (req, res) => {
  try {
    const { event, payload, signature } = req.body;
    
    // Verify webhook signature
    if (!verifyWebhookSignature(req.body, signature)) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    
    // Process webhook event
    await processWebhookEvent(event, payload);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Neo4j backup endpoint
app.post('/neo4j/backup', async (req, res) => {
  try {
    const { datasetId, options } = req.body;
    
    // Create backup
    const backupResult = await createNeo4jBackup(datasetId, options);
    
    // Store backup metadata in Firestore
    await db.collection('backups').add({
      ...backupResult,
      createdAt: new Date(),
      userId: req.headers['x-user-id'], // Assuming user ID is passed in header
    });
    
    res.json({ success: true, backup: backupResult });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed' });
  }
});

// Export Express app as Firebase Function
export const api = onRequest(app);

// Scheduled function for automatic backups
export const scheduledBackup = onSchedule('0 2 * * *', async (event) => {
  console.log('Running scheduled backup...');
  
  try {
    // Get all active datasets
    const datasetsSnapshot = await db.collection('neo4jDatasets')
      .where('autoBackup', '==', true)
      .get();
    
    for (const doc of datasetsSnapshot.docs) {
      const dataset = doc.data();
      
      try {
        const backupResult = await createNeo4jBackup(doc.id, {
          compressed: true,
          encrypted: true,
        });
        
        // Store backup metadata
        await db.collection('backups').add({
          ...backupResult,
          createdAt: new Date(),
          userId: dataset.ownerId,
          automated: true,
        });
        
        console.log(`Backup completed for dataset: ${doc.id}`);
      } catch (error) {
        console.error(`Backup failed for dataset ${doc.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Scheduled backup error:', error);
  }
});

// Analytics processing function
export const processAnalytics = onDocumentCreated('analytics/{eventId}', async (event) => {
  const eventData = event.data?.data();
  
  if (!eventData) return;
  
  try {
    // Process analytics event
    await processAnalyticsEvent(eventData);
    
    // Update user analytics summary
    if (eventData.userId) {
      const userStatsRef = db.collection('userStats').doc(eventData.userId);
      
      await userStatsRef.set({
        lastActivity: new Date(),
        totalEvents: (await userStatsRef.get()).data()?.totalEvents || 0 + 1,
      }, { merge: true });
    }
  } catch (error) {
    console.error('Analytics processing error:', error);
  }
});

// API usage tracking function
export const trackApiUsage = onDocumentUpdated('sessions/{sessionId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  
  if (!beforeData || !afterData) return;
  
  try {
    // Calculate usage difference
    const usageDiff = calculateUsageDifference(beforeData.apiUsage, afterData.apiUsage);
    
    if (Object.keys(usageDiff).length > 0) {
      // Update daily usage statistics
      const today = new Date().toISOString().split('T')[0];
      const usageRef = db.collection('dailyUsage').doc(`${afterData.userId}-${today}`);
      
      await usageRef.set({
        userId: afterData.userId,
        date: today,
        usage: usageDiff,
        updatedAt: new Date(),
      }, { merge: true });
      
      // Check for usage thresholds
      await checkUsageThresholds(afterData.userId, usageDiff);
    }
  } catch (error) {
    console.error('API usage tracking error:', error);
  }
});

// Cleanup old data function
export const cleanupOldData = onSchedule('0 3 * * 0', async (event) => {
  console.log('Running weekly cleanup...');
  
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Clean up old analytics events
    const oldAnalytics = await db.collection('analytics')
      .where('timestamp', '<', oneMonthAgo)
      .limit(1000)
      .get();
    
    const batch = db.batch();
    oldAnalytics.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log(`Cleaned up ${oldAnalytics.size} old analytics events`);
    
    // Clean up old backup metadata (keep backups, just metadata)
    const oldBackups = await db.collection('backups')
      .where('createdAt', '<', oneMonthAgo)
      .limit(1000)
      .get();
    
    const backupBatch = db.batch();
    oldBackups.docs.forEach(doc => backupBatch.delete(doc.ref));
    await backupBatch.commit();
    
    console.log(`Cleaned up ${oldBackups.size} old backup records`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

// Helper functions
async function forwardToLLMProviders(message: string, providers: string[]) {
  // Implementation would forward to actual LLM providers
  // This is a placeholder
  return providers.map(provider => ({
    providerId: provider,
    response: `Mock response from ${provider}`,
    metadata: {
      tokensUsed: 100,
      responseTime: 500,
      cost: 0.001,
    },
  }));
}

async function saveChatMessage(sessionId: string, message: string, responses: any[]) {
  const messagesRef = db.collection('chatSessions').doc(sessionId).collection('messages');
  
  // Save user message
  await messagesRef.add({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });
  
  // Save AI responses
  for (const response of responses) {
    await messagesRef.add({
      role: 'assistant',
      content: response.response,
      providerId: response.providerId,
      metadata: response.metadata,
      timestamp: new Date(),
    });
  }
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  // Implement webhook signature verification
  return true; // Placeholder
}

async function processWebhookEvent(event: string, payload: any) {
  // Process different types of webhook events
  console.log(`Processing webhook event: ${event}`, payload);
}

async function createNeo4jBackup(datasetId: string, options: any) {
  // Implementation would create actual Neo4j backup
  return {
    id: `backup-${Date.now()}`,
    datasetId,
    sizeBytes: 1024 * 1024, // 1MB placeholder
    checksum: 'mock-checksum',
    options,
  };
}

async function processAnalyticsEvent(eventData: any) {
  // Process analytics event for insights
  console.log('Processing analytics event:', eventData);
}

function calculateUsageDifference(before: any, after: any) {
  const diff: any = {};
  
  // Calculate the difference in API usage
  for (const providerId in after) {
    const beforeUsage = before[providerId] || { tokensUsed: 0, cost: 0, requestCount: 0 };
    const afterUsage = after[providerId];
    
    if (afterUsage.tokensUsed > beforeUsage.tokensUsed) {
      diff[providerId] = {
        tokensUsed: afterUsage.tokensUsed - beforeUsage.tokensUsed,
        cost: afterUsage.cost - beforeUsage.cost,
        requestCount: afterUsage.requestCount - beforeUsage.requestCount,
      };
    }
  }
  
  return diff;
}

async function checkUsageThresholds(userId: string, usageDiff: any) {
  // Check if user has exceeded usage thresholds
  for (const providerId in usageDiff) {
    const usage = usageDiff[providerId];
    
    if (usage.cost > 10) { // $10 threshold
      // Send notification or webhook
      console.log(`User ${userId} exceeded cost threshold for ${providerId}`);
    }
  }
}