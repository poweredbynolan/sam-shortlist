const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = express();

// Simple React component
const App = () => React.createElement('div', null, 'Hello from React!');

app.get('/', (req, res) => {
  // Render React component to a string
  const appString = ReactDOMServer.renderToString(React.createElement(App));
  // Send the rendered HTML to the client
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSR with React</title>
</head>
<body>
    <div id="root">${appString}</div>
    <script src="/client.js"></script>
</body>
</html>`);
});

// Serve static files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
