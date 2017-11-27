# They say it's risky, should I go?

# To obtain our results and explanations for milestone 2, please check milestone2.md



![avalanche](images/avalanche2.gif)





For milestone 2 refer to the [following part](#Deliverables for milestones 2).

## Abstract

Risk zero does not exist in alpinism. Statistical models have been developed to assess this risk but they do not prevent tragedies. We do not claim that we can do better, but given that most of the accidents are due to bad people decisions, we are convinced that raising concern about the past mountaineering accidents can strongly improve alpinists' judgement in the future. The aim of this project is to gather meteorological and environmental data (weather condition, precipitations, snowpack, wind, temperatures, slopes, exposures, time of day…) along with avalanche cases and casualties. By leveraging means of interactive visualization, we will provide the skiers ways to understand the conditions of previous cases and maybe hints that could have changed the outcome. Our observational study will focus on the Swiss Alps.

## Research questions

- What is the influence of weather conditions on past avalanche cases?
- Can we evaluate individuals' decisions when informed of snowpack quality and avalanche risk report? Are they less likely to ride in dangerous areas?
- What is the best way to visualize the 10 days of snow, weather conditions, slopes, orientation, avalanche risk before an avalanche case?
- Is there any unexpected correlation that current statistical models do not capture?
- Are avalanche accidents more fatal with a risk level of 3 than with a risk level of 5 for example? Or just more frequent?

## Datasets

Note that we looked for datasets for both France and Switzerland, we present the whole result of our exploration but we will focus on Switzerland due to lack of public information on the French side.

To conduct our studies we need to cross two types of datasets:

#### Avalanche report datasets

- The [*Institute for Snow and Avalanche Research* (SLF)](https://www.slf.ch/en/avalanches/destructive-avalanches-and-avalanche-accidents/avalanche-accidents-of-the-past-20-years.html) provides tables and maps of the fatal avalanche accidents (>300 with casualties) of the past 20 years in **Switzerland**. It includes precise geolocation, date, slope orientation, elevation and number of casualties/death.
- The [Restauration des Terrains en Montagne (RTM)](http://rtm-onf.ifn.fr/query/show-query-form/SCHEMA/RAW_DATA#consultation_panel) database provides around 10'000 cases of avalanches in **France**. Approximately one third of them are in the Alps and in the time span that we will focus on (after 2000).
- The [data-avalanche.org](http://www.data-avalanche.org/list) website has a dataset gathering avalanches information in the Alps containing the location, the characteristic, the date, the type of snow and the danger of avalanches recorded in both **France and Switzerland**. The majority have no victim which is interesting for our observational study to have "negative" samples (e.g. people did not ride in this dangerous area).
- [Avalanche casualties](https://public.opendatasoft.com/explore/dataset/accidents-avalanche-2014-2017/) in France since 2014 with date and approximate location

#### Snow/meteorological dataset

- The [SLF archives](https://www.slf.ch/fr/bulletin-davalanches-et-situation-nivologique/archives.html?tx_wslavalanches_archiv%5Bpath%5D=%2Fuser_upload%2Fimport%2Flwdarchiv%2Fpublic%2F&tx_wslavalanches_archiv%5Baction%5D=showArchiv&tx_wslavalanches_archiv%5Bcontroller%5D=Avalanche&cHash=c71751a643ec4629e21b0306033ccd59) contains daily maps for the last 15 years of [avalanche risk](https://www.slf.ch/fileadmin/user_upload/import/lwdarchiv/public/2014/gk/fr/pdf/201312310800_gk_c_fr_map.pdf), [snow level](https://www.slf.ch/fileadmin/user_upload/import/lwdarchiv/public/2014/hstop/fr/gif/201401230800_hstop_fr_c.gif), [fresh snow](https://www.slf.ch/fileadmin/user_upload/import/lwdarchiv/public/2014/hn1/fr/gif/20131115_hn1_fr_c.gif), [avalanche bulletin](https://www.slf.ch/fileadmin/user_upload/import/lwdarchiv/public/2014/sw/en/pdf/201312011700_snow_weather_en.pdf) (structured text)
- Swiss Open Data unfortunately does not have daily weather data archive, we only found [last 10 minute weather situation](https://opendata.swiss/en/dataset/messdaten-smn-swissmetnet) in all Switzerland (same as [meteo suisse](http://www.meteoschweiz.admin.ch/home/wetter/messwerte/messwerte-an-stationen.html?param=temperature)) or [monthly aggregates](https://opendata.swiss/en/dataset/klimanormwerte). It is not usable for our purpose as historical data is missing


#### Comments

We are aware that using external datasets is risky but we are very motivated by this topic. It is difficult to estimate the size and exploitability of our datasets as we have not been through an in-depth analysis for now but we think that the plan in the next section is managable.

We might also use *news articles* to extract data stories and outline interesting avalanche cases with details, engaging more the reader. These articles would be hand picked, that is why we do not consider this as a core dataset.

## Objectives for milestone 2

- **Fetch the data.** We need to download and parse all the snow/meteorological data and the avalanches report

  - For the maps, we will clear the background and run KNN to get regions of avalanche hazard, snow height and fresh snow,
  - Parse textual reports to extract temperature and wind information,
  - Data cleaning on the avalanche report tables.
- **Join information.** Build clean dataframes with meteorological/environmental data for each avalanche. Be able to explore 10 days of past data in the region for a given event.
- **Look at patterns.** Get a better understanding of risk and casualties correlation (positive/negative).




​