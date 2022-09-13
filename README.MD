# KetcherSVC

Backend Service to render molfiles to SVG using Ketcher.

## Usage

Simply send a HTTP POST request to the service with the molfile as body.

Request:

```
POST http://service/render
Content-Type: application/json
{ molfile: <molfile goes here> }
```

Reply:

```
{ svg: <svg goes here> }
```
