import { prisma } from './prisma';
import { dispatchWebhook } from './webhooks';
import { sendUptimeAlert } from './mail';
import { validateSafeUrl } from './ssrf';

/**
 * [SaaS INFRA] - Health Checker
 * Performs an HTTP GET request to verify a site is UP and records latency.
 */
export async function performCheck(monitorId: string, url: string) {
  const startTime = Date.now();
  
  try {
    const safeUrl = await validateSafeUrl(url);

    const response = await fetch(safeUrl, {
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
      include: { 
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // [SECURITY] If monitor was deleted during the check, stop immediately
    if (!monitor) {
      console.log(`[MONITOR] Skip recording check for deleted monitor: ${monitorId}`);
      return { status, latency, message };
    }

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

    // Dispatch Webhook & Email on change
    if (monitor.status !== status) {
      console.log(`[MONITOR CHANGE] ${monitor.name}: ${monitor.status} -> ${status}`);
      
      const event = status === 'DOWN' ? 'MONITOR_DOWN' : 'MONITOR_UP';
      await dispatchWebhook(monitor.userId, event, {
        monitorId,
        name: monitor.name,
        url,
        latency,
        message
      });

      // Send Email Alert
      if (monitor.user?.email) {
        console.log(`[EMAIL ALERT] Sending to ${monitor.user.email}`);
        sendUptimeAlert({
          email: monitor.user.email,
          userName: monitor.user.name || 'Developer',
          name: monitor.name,
          url,
          status,
          message,
          latency
        }).catch(console.error);
      }
    }

    return { status, latency, message };
  } catch (error) {
    const latency = Date.now() - startTime;
    const status = 'DOWN';
    const message = error instanceof Error ? error.message : 'Connection failed';

    // Verify the monitor still exists before trying to record an error check
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      include: { 
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!monitor) return { status, latency, message };

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

    if (monitor.status !== status) {
      // Dispatch Webhook & Email on change
      const event = status === 'DOWN' ? 'MONITOR_DOWN' : 'MONITOR_UP';
      await dispatchWebhook(monitor.userId, event, {
        monitorId,
        name: monitor.name,
        url,
        latency,
        message
      });

      // Send Email Alert
      if (monitor.user?.email) {
        sendUptimeAlert({
          email: monitor.user.email,
          userName: monitor.user.name || 'Developer',
          name: monitor.name,
          url,
          status,
          message,
          latency
        }).catch(console.error);
      }
    }

    return { status, latency, message };
  }
}

