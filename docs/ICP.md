## Containerize the app and deploy to IBM Cloud Private

### Create a Docker container

Use provided `Dockerfile` to build the application container:

```
cd ~/b2m-nodejs/src
docker build -t b2m-nodejs .
```

Test container locally (make sure you stopped the local Node.js server and removed previous version of this docker container).

```
docker stop b2m-nodejs
docker rm b2m-nodejs
docker run --name btm-nodejs -d -p 3001:3001 b2m-nodejs
```
Access `http://localhost:3001` to verify the application is running.


Now, our Node.js application container can be deployed on ICP cluster. Make sure the `kubectl` client is configured to connect to your ICP cluster. More information [here](https://www.ibm.com/support/knowledgecenter/SSBS6K_3.1.1/manage_cluster/install_kubectl.html).

The `b2m-nodejs` application container image has been uploaded to public Docker Hub: `rszypulka/b2m-nodejs`. You can also upload it to the local ICP Container Registry.

### Deploy b2m-nodejs application to the ICP cluster

Review provided YAML file `b2m-nodejs-icp.yml` and use it to deploy the application to IBM Cloud Private cluster. `b2m-nodejs` deployment object will pull application image container `rszypulka/b2m-nodejs` from Docker Hub.

```
kubectl apply -f b2m-nodejs-icp.yml
```

Verify deployment status.

```
$ kubectl get deploy b2m-nodejs -n default
NAME         DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
b2m-nodejs   1         1         1            1           4h
```

Get the application URL by running these commands:

```
export NODE_PORT=$(kubectl get --namespace default -o jsonpath="{.spec.ports[0].nodePort}" services b2m-nodejs)
export NODE_IP=$(kubectl get nodes -l proxy=true -o jsonpath="{.items[0].status.addresses[?(@.type==\"Hostname\")].address}")
echo http://$NODE_IP:$NODE_PORT
```

Use the browser to access the application URL: `http://<node_external_ip>:<external_nodeport>` 



## Enable monitoring using ICP Prometheus and Grafana

Add the following configuration in the `monitoring-prometheus` ConfigMap, `scrape_configs:` section.

```
    scrape_configs:
      - job_name: 'b2m-nodejs'
        scrape_interval: 20s
        static_configs:
          - targets:
            - b2m-nodejs.default.svc:80
            labels:
              service: 'my-service'
              group: 'production'
```
Make sure the indentation is correct.

[Import](http://docs.grafana.org/reference/export_import/) provided Grafana dashboard `grafana-dashboard.json`.

Generate ICP application traffic using provided script:

```
./load_test_icp.sh <application_url>
```
Use the `<application_url>` collected in previous chapter.

Access the ICP Grafana console and verify it properly shows metrics.


## Define the kubernetes liveness probe for use with built-in application health check

The provided `b2m-nodejs-icp.yml` deployment YAML file define [liveness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/#define-a-liveness-http-request) that uses the implemented `/healthz` route.

```
   livenessProbe:
     httpGet:
       path: /healthz
       port: 3001
     initialDelaySeconds: 3
     periodSeconds: 10
```
Check the URL: `http://<node_external_ip>:<external_nodeport>/healthz` to verify current health status.

>Expected output: `{"status":"ok"}`

Simulate an application problem by setting "bad health" status: `http://<node_external_ip>:<external_nodeport>/bad-health`

>Expected output: `{"status":"App health set to 'false'"}`

Quickly check the health URL again: `http://<node_external_ip>:<external_nodeport>/healthz`

>Expected output: `{"error":"Application unhealthy"}`

After up to 10s the application pod should be automatically restarted by kubernetes and health set back to `{"status":"ok"}`

>Expected output: `{"status":"ok"}`

Verify the pod has been restarted.

```
kubectl describe pod b2m-nodejs
```

in the `Events` section you should see events similar to the following:

```
Events:
  Type     Reason     Age               From                     Message
  ----     ------     ----              ----                     -------
  Warning  Unhealthy  3m (x9 over 58m)  kubelet, 172.16.254.163  Liveness probe failed: HTTP probe failed with statuscode: 500
  Normal   Pulling    2m (x4 over 1h)   kubelet, 172.16.254.163  pulling image "rszypulka/b2m-nodejs"
  Normal   Killing    2m (x3 over 58m)  kubelet, 172.16.254.163  Killing container with id docker://node-prom:Container failed liveness probe.. Container will be killed and recreated.
  Normal   Pulled     2m (x4 over 1h)   kubelet, 172.16.254.163  Successfully pulled image "rszypulka/b2m-nodejs"
  Normal   Created    2m (x4 over 1h)   kubelet, 172.16.254.163  Created container
  Normal   Started    2m (x4 over 1h)   kubelet, 172.16.254.163  Started container
```
