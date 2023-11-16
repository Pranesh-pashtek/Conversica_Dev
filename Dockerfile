FROM node:16-alpine as build

WORKDIR /app

COPY . .

RUN npm install

RUN PUBLIC_URL=/assets BUILD_PATH=../api/dist/ui npm run build:ui && npm run build:api

FROM node:16-alpine

WORKDIR /app

COPY --from=build /app/node_modules/ node_modules/
# The working dir in the build stage of this image is
# also /app. And we need to copy the app folder from
# within that. That's why it's /app/app/...
COPY --from=build /app/app/api/dist/ dist/
COPY --from=build /app/app/api/package.json .

CMD ["npm", "run", "start:server", "start:ui"]