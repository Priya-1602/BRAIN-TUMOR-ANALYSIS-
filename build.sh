#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build

# Install Python dependencies
pip install -r requirements.txt

# Create a simple serverless function for Netlify
mkdir -p functions
cat > functions/app.py << 'EOF'
from app import app
from flask import Response, request
import json

def handler(event, context):
    with app.app_context():
        # Convert API Gateway event to Flask request
        if 'httpMethod' in event:
            # API Gateway v2 (HTTP API)
            if event.get('version') == '2.0':
                method = event['requestContext']['http']['method']
                path = event['rawPath']
                headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
                body = event.get('body', '')
                query_string = event.get('rawQueryString', '')
            # API Gateway v1 (REST API)
            else:
                method = event['httpMethod']
                path = event['path']
                headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
                body = event.get('body', '')
                query_string = event.get('queryStringParameters', '')
                if query_string:
                    query_string = '&'.join([f"{k}={v}" for k, v in query_string.items()])
        else:
            # Direct function invocation
            method = event.get('httpMethod', 'GET')
            path = event.get('path', '/')
            headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
            body = event.get('body', '')
            query_string = event.get('queryString', '')

        # Create a test request context
        with app.test_request_context(
            path=path,
            method=method,
            headers=headers,
            data=body,
            query_string=query_string
        ):
            # Preprocess Request
            rv = app.preprocess_request()
            if rv is None:
                # Dispatch Request
                rv = app.dispatch_request()
            response = app.make_response(rv)
            response = app.process_response(response)

        # Convert response to API Gateway format
        return {
            'statusCode': response.status_code,
            'headers': dict(response.headers),
            'body': response.get_data(as_text=True)
        }

# For local testing
if __name__ == '__main__':
    app.run(debug=True)
EOF

# Make the build script executable
chmod +x build.sh
