# APPUiO Cloud Portal (Web Frontend)

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `npm run test` to execute the unit tests with jest.

## Running End-to-End Tests

Run `npm run e2e-dev` to execute the end-to-end tests with cypress.

## Development

1. Duplicate `environments/environment.ts` and rename the file to `environment.development.ts`. Replace the values where necessary (mainly: `clientId: 'local-dev'` and ` issuer: 'https://id.dev.appuio.cloud/auth/realms/<your-realm-name>'`).
2. Start the local control api: https://github.com/appuio/control-api/tree/master/local-env
3. Run `kubectl proxy` to start a proxy server between localhost and the Kubernetes API server.
4. Run `npm start` to start angular locally.

### Control API

If you haven't yet setup the local control api, follow the instructions in the [control-api](https://github.com/appuio/control-api/tree/master/local-env).

The control api serves all the data, such as organizations, teams, and users.

Use the yaml files provided in the control api repo under /config/examples to create the custom resources in your local cluster.

E.g. `kubectl apply -f config/examples/organization.yaml`

Ensure that when you create a user, you replace the name with the one you used during the setup of the local control api for keycloak.

### Keycloak

Use the dev instance from VSHN: https://id.dev.appuio.cloud
(if that returns a 404, use https://id.dev.appuio.cloud/auth/admin/master/console/)

To add a new dev realm for yourself, follow the instructions in the [control-api](https://github.com/appuio/control-api) under 'local-env'.
Note: Once the setup is done, login to keycloak, select the new realm on the top left, and under clients -> 'local-dev' -> Settings add `localhost:4200` (or `*`) to both 'Valid Redirct URIs' and 'Web Origins'.

## Configuration

The APPUiO Cloud Portal can be configured with the `config.json` file which is located in the `src` directory.

## Deploy to OpenShift

Setup the project and deploy user

```bash
nstest=appuio-control-api-preview
sa=cloud-portal-deployer

oc new-project $nstest

oc -n $nstest create sa $sa

# Allow the deployer user to manage deployments in test namespace
oc -n $nstest policy add-role-to-user admin -z $sa --rolebinding-name admin
oc -n $nstest policy add-role-to-user system:image-pusher -z $sa
echo

# Annotate namespace
oc annotate namespace $nstest --overwrite "app.kubernetes.io/managed-by=GitHub Actions" "app.kubernetes.io/source=https://github.com/appuio/cloud-portal"

# Get SA token
oc -n $nstest sa get-token $sa
```

Now, put the token into GitHub's Secrets

## Use existing Keycloak in preview deployments

A GitHub action workflows dynamically registers the redirect URL in an existing Keycloak instance via API.

1. Create a new User in master realm
1. Set a secure password
1. In the role mappings, select `appuio-cloud-dev-realm` in the "Client Roles" dropdown.
   Add `manage-clients`.
1. Create a new Client in the target realm (e.g. `appuio-control-api`)
1. When editing the client, the URL shows the UUID of the client.
   Copy this value and set it in `.github/keycloak-redirect-url.sh`.
1. Update the `KEYCLOAK_USER` and `KEYCLOAK_PASSWORD` secrets in GitHub environment `preview` with the values in the first steps.
