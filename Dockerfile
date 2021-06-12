FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install g++ -y
RUN apt-get install python -y
RUN apt-get install default-jre -y
RUN apt-get install default-jdk -y

