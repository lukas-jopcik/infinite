const http = require('http');
const url = require('url');
const { handler } = require('./articles-api.js');

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(async (req, res) => {
    try {
        // Parse URL
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const queryStringParameters = parsedUrl.query;
        
        // Create Lambda event object
        const event = {
            httpMethod: req.method,
            path: path,
            queryStringParameters: queryStringParameters,
            headers: req.headers,
            body: null
        };
        
        // Handle POST body
        if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                event.body = body;
                await handleRequest(event, res);
            });
        } else {
            await handleRequest(event, res);
        }
        
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

async function handleRequest(event, res) {
    try {
        const result = await handler(event);
        
        // Set headers
        Object.keys(result.headers || {}).forEach(key => {
            res.setHeader(key, result.headers[key]);
        });
        
        // Set status code
        res.writeHead(result.statusCode || 200);
        
        // Send response
        res.end(result.body || '');
        
    } catch (error) {
        console.error('Handler error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

server.listen(PORT, () => {
    console.log(`🚀 Local API server running on http://localhost:${PORT}`);
    console.log(`📡 Articles API available at http://localhost:${PORT}/articles`);
    console.log(`🔍 Search API available at http://localhost:${PORT}/articles/search`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});
