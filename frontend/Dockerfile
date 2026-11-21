FROM node:22-alpine AS dependencies

WORKDIR /app
ENV NG_CLI_ANALYTICS=false
COPY package*.json ./
RUN npm ci

FROM dependencies AS test

COPY . .
RUN npm test -- --watch=false

FROM test AS build

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
