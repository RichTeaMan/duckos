FROM ubuntu

COPY . /duckos

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl make gcc g++ vim libasound2-dev mpg123

RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt-get update && \
    apt-get install -y nodejs

WORKDIR /duckos/src
RUN npm install

ENTRYPOINT npm run speech
