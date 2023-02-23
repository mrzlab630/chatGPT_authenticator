# Authorisation for chat.openai.com


#### Example of using the script


```
import chatGPTAuthenticator from "./chatGPTAuthenticator"

 const {result, error} = await chatGPTAuthenticator( {email, password})
```



#### TOR as a proxy


```
sudo apt-get install tor
```

```
sudo nano /etc/tor/torrc

SocksPort 9050
ControlPort 9051
HashedControlPassword 16:07DC6A6EA7C63934600250695DBB4A11AF7D29B0C63072A7FF9F755E89
CookieAuthentication 1
MaxCircuitDirtiness 10

```

#### Multiformat launch

```
sudo mkdir /var/lib/tor1
sudo nano /etc/tor/torrc.1

SocksPort 9060
ControlPort 9061
DisableNetwork 0
HashedControlPassword 16:07DC6A6EA7C63934600250695DBB4A11AF7D29B0C63072A7FF9F755E89
CookieAuthentication 1
DataDirectory /var/lib/tor1

```


```
sudo mkdir /var/lib/tor2
sudo nano /etc/tor/torrc.2

SocksPort 9070
ControlPort 9071
DisableNetwork 0
HashedControlPassword 16:07DC6A6EA7C63934600250695DBB4A11AF7D29B0C63072A7FF9F755E89
CookieAuthentication 1
DataDirectory /var/lib/tor2

```


```
sudo mkdir /var/lib/tor3
sudo nano /etc/tor/torrc.3

SocksPort 9080
ControlPort 9081
DisableNetwork 0
HashedControlPassword 16:07DC6A6EA7C63934600250695DBB4A11AF7D29B0C63072A7FF9F755E89
CookieAuthentication 1
DataDirectory /var/lib/tor3

```


```
sudo service tor restart
```


```
screen sudo tor -f /etc/tor/torrc.1 
screen sudo tor -f /etc/tor/torrc.2
screen sudo tor -f /etc/tor/torrc.3 

```

#### Test


```
curl --socks5 127.0.0.1:9060 http://checkip.amazonaws.com/
```