# TODO

Data on [S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/ada-avalanches/)

```bash
pip3 install aws-cli
aws s3 sync s3://ada-avalanches/ ./slf-data/ --recursive
```


## Milestone 3 deliverables

- 2 pages:
  - one story telling
  - one interactive dashboard
- Ideas of dashboard component
  - Face exposure "rosace" like a mountain with radius inversely proportional to elevation
  - elevation filter
  - Map of past avalanches
  - Time selector by hydrological years or finer granularity
  - Map selection: space (rectange) or region (mountain range) selection
  - Applied filter module (to select/unselect a filter)
  - Danger level selector
  - Death or casualties histogram with x cursor filter
  - Temperature ?
  - Snow show
- Deliverable dashboard component
  - list of metric that it can show
  - way to filter
  - how to display
  - different options of display ?
  - what happens if only one avalanche selected


## Report story telling

