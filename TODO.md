# TODO

## Goal milestone 2

- [ ] Snow maps
      - [ ] Smooth weird texture
      - [ ] Super small granularity snow map
            - [ ] Contiguous contours
- [ ] Danger maps (gefahr)
- [ ] Download dataset casualties in avalanches
- [ ] Text mining on bulletins for temperature/wind/more ?
- [ ] Visualise map with snow/danger/new snow (select one year)
- [ ] Remove boxes
- [ ] Remove labels white





| Friday 17th (1) | Monday 20th (3) | Tuesday 21st (2) | Friday 24th (2) | Monday 27th (4) | Tuesday 28th (2) |
| :-------------: | :-------------: | :--------------: | :-------------: | :-------------: | :--------------: |
|                 |                 |                  |                 |                 |                  |



Data on [S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/ada-avalanches/?region=us-east-1)

```bash
pip3 install aws-cli
aws-cli s3 cp s3://ada-avalanches/ ./slf-data/ --recursive
```





**Brune**

- Snow maps
  - smoothing / low pass filter CV2 or PIL
  - quantization + median -> contours pipeline

**Arnaud**

- Download dataset
- Notebook carte des accidents

**JB**

- Share data
- Remove boxes
- Remove labels white



| Brune | Arnaud            | JB   |
| ----- | ----------------- | ---- |
| Snow  | Dataset avalanche |      |







## Report story telling
