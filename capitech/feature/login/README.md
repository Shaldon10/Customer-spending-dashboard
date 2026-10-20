# Login

This Nx feature library provides the demo login page, authentication state, and route guard. The login service gets the signed-in customer's ID from the API and stores it for dashboard requests. The local mock API uses hardcoded credentials for demonstration only; neither the demo login nor its browser-stored customer ID is production authentication or secures the API.

Run its unit tests from the `capitech` workspace:

```sh
npx nx test login
```
