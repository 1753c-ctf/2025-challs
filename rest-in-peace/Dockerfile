FROM restic/restic:latest

WORKDIR /flag

COPY flag .

ENV RESTIC_REPOSITORY="/backup"
ENV RESTIC_PASSWORD="Christopher"
ENV RESTIC_HOST="AgentAlpha"

RUN restic init
RUN restic backup .
RUN rm flag2.txt
RUN restic backup .
RUN rm flag3.txt
RUN restic backup .
RUN rm flag4.txt 
RUN restic backup .
RUN restic forget --keep-last 1