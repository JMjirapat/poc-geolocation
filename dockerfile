FROM node:20.4.0 as build
WORKDIR /app
COPY . .
RUN npm install --omit=optional \
    && npm run build

FROM nginx:1.25.1 as prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/cert/ /etc/nginx/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]