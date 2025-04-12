FROM nginx:alpine

ARG FLAG
RUN echo $FLAG > /usr/share/nginx/html/index.html

EXPOSE 1337

RUN sed -i 's/listen\s*80;/listen 1337;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]