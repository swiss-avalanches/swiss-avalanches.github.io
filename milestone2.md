## Deliverables for milestones 2

We produced 4 notebooks for this milestone. You can browse through them in `notebooks/`. Our project involves a lot of data scraping, data massage and computer vision.

#### 1. Data scraping

[SLF archives](https://www.slf.ch/en/avalanche-bulletin-and-snow-situation/archive.html) data scraping: we contacted by email the SLF data managers to see if we could have access to their database in SFTP or any nice protocol. But they said we had to use the HTTP interface. No problem, we scraped hard core for one night. This was done in two steps, first extracting all the hierarchy of directories from HTML pages (see `notebooks/slf-scraping.ipynb`) and then downloading the data from each URL with `src/download.py` script. Filters were applied to download only interesting files.

#### 2. Map extraction

You can find our work in `notebooks/map-extraction`. We had to develop a handful of methods to extracts the snow/danger region 

#### 3. Avalanches accidents

[SLF avalanche accidents](https://www.slf.ch/en/avalanches/destructive-avalanches-and-avalanche-accidents/avalanche-accidents-of-the-past-20-years.html) extraction: we downloaded accidents data from the website with precise coordinates for each accident. A map showing accidents depending on the risk level was made in `notebooks/accidents.ipynb` to visualise the data points.

#### 4. Text scraping

SLF archives text scraping: we used daily avalanche reports to extract temperature and wind observations per day. We extracted the text from PDF files, filtered meaningful sentences by keyword and extracted the figures. You can find this process described in depth in `notebooks/text-extraction.ipynb`.