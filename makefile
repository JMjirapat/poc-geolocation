REMOTE_HOST := qrthrough
APP_NAME := pov-geolocation

build-deploy:
	docker build --platform linux/amd64 -t ${APP_NAME} .
	docker save ${APP_NAME} > ${APP_NAME}.tar
	docker rmi ${APP_NAME}
	scp ./${APP_NAME}.tar ${REMOTE_HOST}:/root/
	rm ./${APP_NAME}.tar
	ssh -t ${REMOTE_HOST} 'docker rm $$(docker ps -aqf "name=${APP_NAME}") -f \
    &&  docker rmi $$(docker images -aqf "reference=${APP_NAME}") \
    &&  docker load < /root/${APP_NAME}.tar \
    &&  rm /root/${APP_NAME}.tar \
    &&  docker run -d -p 8888:80 --name ${APP_NAME} ${APP_NAME}'
init-deploy:
	docker build --platform linux/amd64 -t ${APP_NAME} .
	docker save ${APP_NAME} > ${APP_NAME}.tar
	docker rmi ${APP_NAME}
	scp ./${APP_NAME}.tar ${REMOTE_HOST}:/root/
	rm ./${APP_NAME}.tar
	ssh -t ${REMOTE_HOST} 'docker load < /root/${APP_NAME}.tar \
    &&  rm /root/${APP_NAME}.tar \
    &&  docker run -d -p 8888:80 --name ${APP_NAME} ${APP_NAME}'