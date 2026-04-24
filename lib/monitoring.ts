import { prisma } from './prisma';
import { dispatchWebhook } from './webhooks';

/**
 * [SaaS INFRA] - Health Checker
 * Performs an HTTP GET request to verify a site is UP and records latency.
 */
export async function performCheck(monitorId: string, url: string) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'NextOptimizerMonitor/1.0' },
      cache: 'no-store'
    });

    const latency = Date.now() - startTime;
    const status = response.ok ? 'UP' : 'DOWN';
    const message = response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`;

    // Get current monitor to check for status change
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      select: { status: true, userId: true, name: true }
    });

    // Record the check
    await prisma.check.create({
      data: {
        monitorId,
        status,
        latency,
        message
      }
    });

    // Update monitor status
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status,
        lastChecked: new Date()
      }
    });

    // Dispatch Webhook on change
    if (monitor && monitor.status !== status) {
      const event = status === 'DOWN' ? 'MONITOR_DOWN' : 'MONITOR_UP';
      await dispatchWebhook(monitor.userId, event, {
        monitorId,
        name: monitor.name,
        url,
        latency,
        message
      });
    }

    return { status, latency, message };
  } catch (error) {
    const latency = Date.now() - startTime;
    const status = 'DOWN';
    const message = error instanceof Error ? error.message : 'Connection failed';

    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      select: { status: true, userId: true, name: true }
    });

    await prisma.check.create({
      data: {
        monitorId,
        status,
        latency,
        message
      }
    });

    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status,
        lastChecked: new Date()
      }
    });

    if (monitor && monitor.status !== status) {
      await dispatchWebhook(monitor.userId, 'MONITOR_DOWN', {
        monitorId,
        name: monitor.name,
        url,
        latency,
        message
      });
    }

    return { status, latency, message };
  }
}

