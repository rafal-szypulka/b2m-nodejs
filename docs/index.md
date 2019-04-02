# Build to Manage - Node.js application monitoring and logging lab

During this lab we will instrument a sample Node.js application for logging to use with log analytics tools like [Elastic stack](http://elastic.co) as well as for monitoring with [Prometheus](https://prometheus.io) and [Grafana](https://grafana.com).

Instrumentation of the application code for monitoring and logging is part of the general concept we call **Build to Manage**. It specifies the practice of activities developers can do in order to provide manageability aspects as part of an application release.

## Lab outline

- Fork and clone the Github repository and review the source code
- Configure logging library and add log messages
- Configure and run Elastic stack in Docker Compose
- Integrate application logs with Elastic stack
- What to instrument? - the RED method
- Instrument application code with Node.js client library for Prometheus
	- Enable a default set of metrics offered by `prom-client` library
	- Define custom metrics (counter and histogram)
- Configure and run Prometheus and Grafana stack in Docker Compose
- Run example PromQL queries
- Configure sample alert in Prometheus
- Configure Grafana
	- Import sample dashboard
	- Define a custom dashboard panel
- Deploy to IBM Cloud Private cluster and configure monitoring using ICP Prometheus and Grafana
- Configure kubernetes liveness probe using application health check

## Prerequisites
Install the following software on your workstation or use the provided VM.

- Node.js
- npm
- Docker
- Docker Compose
- kubectl

## Review the application code and run it locally

Logon to GitHub using your user and password.
Access the following repository and click `Fork`.

```
https://github.com/rafal-szypulka/b2m-nodejs
```

From now on you will work on your own fork of the application project

```
https://github.com/<username>/b2m-nodejs
```

where `<username>` is your GitHub username.

Clone the `b2m-nodejs` lab repository to your home directory using:

```
cd
git clone https://github.com/<username>/b2m-nodejs
```

Most of the commands in this lab should be executed from the `b2m-nodejs/src` directory:

```
cd b2m-nodejs/src
```
Review the application code in `server.js`. Application simulates a transaction with random response time on the following URL:

```
http://localhost:3001/checkout
```

About 20% of requests should return error and 500 HTTP response code.


Run the Node Package Manager to install all required node modules: 

```
npm install 
```
and then

``` 
npm start server.js
``` 
to start the application. Node.js server should start and listen on port `3001`.


Use internet browser to access `http://localhost:3001/checkout`


```
{"status":"RSAP0001I: Transaction OK","transactionTime":"22ms"}
```

or:

```
{"error":"RSAP0010E: Severe problem detected"}
```

Refresh the page a couple of times and you should see random transaction response times.