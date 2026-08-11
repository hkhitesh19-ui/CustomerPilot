import { http, HttpResponse } from 'msw';

export const evolutionHandlers = [
  // Fetch Instances
  http.get('*/instance/fetchInstances', () => {
    return HttpResponse.json([
      {
        id: 'inst_1',
        name: 'CP_M_mock_merchant',
        connectionStatus: 'open',
      },
    ]);
  }),

  // Connection State
  http.get('*/instance/connectionState/:instanceName', ({ params }) => {
    return HttpResponse.json({
      instance: {
        instanceName: params.instanceName,
        state: 'open',
      },
    });
  }),

  // Create Instance
  http.post('*/instance/create', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json(
      {
        instance: {
          instanceName: body?.instanceName || 'CP_M_mock',
          status: 'created',
        },
        hash: { apikey: 'mock_instance_key' },
      },
      { status: 201 }
    );
  }),

  // Set Webhook
  http.post('*/webhook/set/:instanceName', () => {
    return HttpResponse.json(
      {
        webhook: { enabled: true },
      },
      { status: 201 }
    );
  }),

  // Send Text Message
  http.post('*/message/sendText/:instanceName', async ({ request }) => {
    const body = (await request.json()) as any;
    const number = body?.number || '919033304707';

    // Simulate Meta 24-hour window / block rules if test number starts with 999
    if (number.includes('9990000000')) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: 'Recipient outside Meta 24-hour customer service window',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      key: {
        id: `mock_msg_${Date.now()}`,
        remoteJid: `${number}@s.whatsapp.net`,
        fromMe: true,
      },
      message: {
        conversation: body?.text || '',
      },
      messageTimestamp: Math.floor(Date.now() / 1000),
      status: 'PENDING',
    });
  }),

  // Send Media Message
  http.post('*/message/sendMedia/:instanceName', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      key: {
        id: `mock_media_${Date.now()}`,
        remoteJid: `${body?.number || '919033304707'}@s.whatsapp.net`,
        fromMe: true,
      },
      message: {
        imageMessage: { caption: body?.caption || '' },
      },
      status: 'PENDING',
    });
  }),
];
