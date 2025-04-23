Please help me deploy a new frontend web application to my existing EKS cluster (`eks1` in `us-east-1`).

**Current Setup:**

*   **EKS Cluster:** Provisioned using Terraform (`infra/main.tf`), version 1.28.
*   **ALB Controller:** Installed via GitHub Actions (`.github/workflows/install_alb_controller.yml`).
*   **Backend Service:** A `quantum-microservice` is deployed using `k8s/quantum-microservice-k8s-deployment.yaml`. This includes a Deployment, a ClusterIP Service (`quantum-microservice-service` on port 8889), and an Ingress resource.
*   **Ingress:** The existing Ingress (`quantum-microservice-ingress` in `k8s/quantum-microservice-k8s-deployment.yaml`) uses `ingressClassName: alb`, is `internet-facing`, listens on HTTP port 80, and currently routes the `Prefix` path `/` to the `quantum-microservice-service` on port 8889.
*   **API Gateway:** An AWS API Gateway sits in front of the ALB, configured via Terraform (`infra/api_gateway.tf`) using the ALB's DNS name.
*   **Deployment Workflow:** Deployments are managed by `.github/workflows/deploy.yml`. This workflow:
    *   Builds and pushes the `quantum-microservice` Docker image (`abhishekt/quantum-microservice:latest`).
    *   Applies the Kubernetes manifests (`k8s/quantum-microservice-k8s-deployment.yaml`).
    *   Waits for the ALB DNS name.
    *   Applies Terraform changes (including API Gateway configuration using the ALB DNS).
    *   Tests the API Gateway endpoints.

**Goal:**

Deploy a standard frontend web application (e.g., React, Vue, Angular) alongside the existing backend service in the same EKS cluster.

**Requirements:**

1.  **Dockerfile:** Assume I have a standard `Dockerfile` for the frontend application located at the root of the project (`./Dockerfile.frontend`). The frontend container serves content on port 80.
2.  **Kubernetes Manifests:**
    *   Generate a Kubernetes `Deployment` manifest for the frontend. Name it `frontend-app-deployment`, use the label `app: frontend-app`, and configure it to use an image like `YOUR_DOCKERHUB_USERNAME/frontend-app:latest`. Use `imagePullPolicy: Always`.
    *   Generate a Kubernetes `Service` manifest for the frontend. Name it `frontend-app-service`, make it a `ClusterIP` type, select the `app: frontend-app` pods, and map port 80 on the service to port 80 on the container.
    *   Combine these into a single YAML file, perhaps named `k8s/frontend-app-k8s.yaml`.
3.  **Ingress Configuration:**
    *   Modify the existing `Ingress` resource definition found in `k8s/quantum-microservice-k8s-deployment.yaml`.
    *   Update the rules to route traffic based on path:
        *   Requests to `/api/` (or a similar distinct path for the backend, maybe keep `/` for the backend if preferred) should go to `quantum-microservice-service` on port 8889.
        *   Requests to `/` (root path) should go to the new `frontend-app-service` on port 80.
    *   Provide the complete updated `Ingress` YAML definition.
4.  **GitHub Actions Workflow Update:**
    *   Modify the existing `.github/workflows/deploy.yml` workflow.
    *   Add steps *before* the existing Kubernetes deployment steps to build and push the frontend Docker image using `./Dockerfile.frontend` to `YOUR_DOCKERHUB_USERNAME/frontend-app:latest`. Ensure multi-platform support like the backend image. Reuse the Docker Hub login step.
    *   Modify the "Deploy Kubernetes Manifests" step (or add a new one) to apply *both* `k8s/quantum-microservice-k8s-deployment.yaml` (containing the updated Ingress) and the new `k8s/frontend-app-k8s.yaml`.
    *   Ensure the rollout status checks and ALB DNS retrieval logic remain functional.
    *   The Terraform apply step should still use the same ALB DNS name, as the Ingress routes are handled by the single ALB.
    *   The API Gateway testing steps should remain the same, targeting the backend paths (e.g., `/api/v1/health`). Optionally, add a basic test for the frontend root path (`/`).
    *   Provide the relevant updated sections or the complete updated `deploy.yml` workflow file.
5.  **Frontend-Backend Communication:** Briefly explain how the deployed frontend application code can make requests to the backend API (e.g., should it use relative paths like `/api/v1/...` which the ALB/API Gateway route, or the full API Gateway invoke URL?).

Please provide the Kubernetes YAML files and the updated GitHub Actions workflow content. Remember to replace placeholders like `YOUR_DOCKERHUB_USERNAME`.