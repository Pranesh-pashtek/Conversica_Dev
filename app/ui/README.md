# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Local Development

Clone the `.env.template` file and rename the copied file to `.env`. It is ignored by .git. Now you can set any env vars
specific to the UI app.

See Create React App's [advanced configuration](https://create-react-app.dev/docs/advanced-configuration/) for the
available environment variables. If you want to set custom environment variables for the app to use, see
[adding development env vars in `.env`](https://create-react-app.dev/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env).

## Production Deployment

A simple deployment of this UI involves the Express.js-based Node.js backend (the `api` folder.) When building for cloud
deployment we should set the `BUILD_PATH` and `PUBLIC_URL` environment variables. The `BUILD_PATH` env var should be set
to `../api/dist/ui` and the `PUBLIC_URL` should be set to `/assets`. This is so that the UI is built to be relative to
the API Node.js app. In a simple deployment scenario, the API would serve the UI files from its directory. To do the same
on your local machine you would set the aforementioned environment variables in the `.env` file. 

In a more modern deployment scenario, we might want to deploy this separate from the API app by pushing the UI files to
a storage bucket (S3, for example) and have a CDN in front of it. But that is rarely necessary for the target purpose of
these apps. Consult a cloud infrastructure expert to learn more about alternate deployment architectures.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
