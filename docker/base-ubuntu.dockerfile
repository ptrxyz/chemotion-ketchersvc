FROM ubuntu:22.04

RUN apt-get update; \
    apt-get install -y --no-install-recommends gnupg wget curl unzip ca-certificates;
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | \
    gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/google.gpg --import; \
    chmod 644 /etc/apt/trusted.gpg.d/google.gpg; \
    echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list; \
    apt-get update -y;
RUN apt-get install -y --no-install-recommends google-chrome-stable; \
    CHROME_VERSION=$(google-chrome --product-version | grep -o "[^\.]*\.[^\.]*\.[^\.]*"); \
    CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION"); \
    wget -q --continue -P /chromedriver "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip"; \
    unzip /chromedriver/chromedriver* -d /usr/local/bin/
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get update -y
RUN apt-get install -y --no-install-recommends nodejs
