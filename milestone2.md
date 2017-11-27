## Deliverables for milestones 2

We produced 4 notebooks for this milestone. You can browse through them in `notebooks/`. Our project involves a lot of data scraping, data massage and computer vision. TODO see s3 bucket

#### 1. Data scraping

[SLF archives](https://www.slf.ch/en/avalanche-bulletin-and-snow-situation/archive.html) data scraping: we contacted by email the SLF data managers to see if we could have access to their database in SFTP or any nice protocol. But they said we had to use the HTTP interface. No problem, we scraped hard core for one night. This was done in two steps, first extracting all the hierarchy of directories from HTML pages (see `notebooks/slf-scraping.ipynb`) and then downloading the data from each URL with `src/download.py` script. Filters were applied to download only interesting files.

#### 2. Map extraction

You can find our work in `notebooks/map-extraction`. We had to develop a handful of methods to extracts the snow/danger regions from the color maps. We applied these methods to danger maps and all kind of snow maps.

- *grey removal:* looking at standard deviation of color channels for each pixel, we could threshold the greys and remove them from the original image,
- *color projection*: due to the noise in the image or minor differences in the color tones, we had to project each pixel's color to the closest color in the reference key (with euclidean distance).
- *mask clipping*: each image having different size or how the country is centered, we had to create binary masks to remove the legend, the title and sometimes extra logos or noise.
- *smoothing*: to remove small imperfections or noisy color projections, we used a median filter in order to get smoother regions and ease the task of contour detection.
- *region detection*: using color detection we extracted the contour of each region.
- *pixel to geo location projection*: once we had contours of the regions in the image (by pixels) we had to transform those into geolocated regions. To do so, we learned a mapping from pixel to geolocations. We took 6 points of references on the image and on Google maps. Note that 3 would have been enough to constraint the problem, but with least square solver we could average out our small mistakes at picking pixel location of the landmarks.
- *GeoJSON creation and website:* to visualize the regions, we transformed them into GeoJSON, smoothed these polygons and displayed them in a really basic HTML interface to check the consistency.

#### 3. Avalanches accidents

[SLF avalanche accidents](https://www.slf.ch/en/avalanches/destructive-avalanches-and-avalanche-accidents/avalanche-accidents-of-the-past-20-years.html) extraction: we downloaded accidents data from the website with precise coordinates for each accident. A map showing accidents depending on the risk level was made in `notebooks/accidents.ipynb` to visualise the data points.

#### 4. Text scraping

SLF archives text scraping: we used daily avalanche reports to extract temperature and wind observations per day. You can find this process described in depth in `notebooks/text-extraction.ipynb`.

- *PDF to text*: we first extracted the text from PDF files, in order to be able to process  the text.
- *Avalanche reports investigation*: these reports were analysed to understand the way the reports were done and find the best solution to extract the data we want in a repeatable way. The difficulty was that, depending on the year and month selected, the reports were organized differently.
- *Paragraph selection*: in the algorithm, the first step consisted in selecting the paragraph in which temperature and wind (of the day) is found. This step was necessary to prevent unwanted matching (for example prevision temperatures)
- *Regex filtering*: meaningful patterns were filtered by keywords to get substrings containing the main information. (for example ['plus 6 degre'] or ['moins 8 degre'])
- *Location matching*: temperatures were associated with their respective location, which could correspond to north, south, east or west.
- *DataFrame creation*: Wind and Temperature data were extracted and loaded into DataFrames. In order to assess the quality of our extraction, we selected a sample and checked by hand the results.