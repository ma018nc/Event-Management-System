FROM node:20-alpine AS build
WORKDIR /app

# copy package manifest(s) and lockfiles first for better caching
COPY package.json package-lock.json* bun.lockb ./
COPY . .

RUN npm install --legacy-peer-deps --silent
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
