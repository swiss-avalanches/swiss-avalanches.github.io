---
layout: page
title: Avalanche data story
subtitle: They say it's risky, should I go ?
use-site-title: true

css:
  - "../css/explore.css"

js:
  - "../js/jquery-1.11.2.min.js"
  - "../js/d3.min.js"
  - "../js/lodash.js"
  - "../js/explore/utils.js"
  - "../js/datastory/dangerMirror.js"
  - "../js/datastory/years.js"
---

 *January 31st, 2015*

#### Piz Vilan, GR, Switzerland: Avalanche kills 5 tourists

![image](../img/images_data_story/avalanche.png)

**Eight** people were swept backcountry touring in an avalanche in Switzerland. **Five** of them did not survive. The announced **danger level** was 3. The death toll on that day was the worst in five years. 

Up to 1.2 metres of snow has fallen in the region in recent days, and authorities had made repeated warnings of continuing avalanche dangers in many parts of the Swiss Alps and the Jura Mountains.

This avalanche went down a mountain's eastern flank at an elevation of 2340 meters. The group of skiers caught was **backcountry touring**. 

There was no immediate word on what triggered the avalanche. 

- *What is the evolution of such accidents over time?*
- *Is the exposure of the location of the accident a main cause?*
- *Are some mountain activities riskier than others?*
- *Is the danger level a good indicator of risk?*

We will try to answer these questions through an interactive visualisation of the last 15 years of avalanche cases.

We know from press release that the group was caught *backcountry touring*, but accidents can also happen *off-piste skiing*. Do both of these activities have the same exposal to danger?

<div class="container-fluid"> <!-- If Needed Left and Right Padding in 'md' and 'lg' screen means use container class -->
    <div class="row">
        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6" id="graph-left"></div>
        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6" id="graph-right"></div>
    </div>
</div>

We can observe that the most deadly levels are 2 <span id="dot-danger-2"></span> and 3 <span id="dot-danger-3"></span>. An explanation of that phenomenon is that low levels of danger (1 <span id="dot-danger-1"></span>) is often synonym of a lower amount of snow and a high level (4 <span id="dot-danger-4"></span> or 5 <span id="dot-danger-5"></span>) repeals skiers to expose themselves to hazard. These are outlier situations that will be excluded from our further analysis.

Backcountry tourers tend to be more experienced than off-pist skiers, is there an explanation to why most qualified alpinists are more easily caught and die under a level 2 of danger?

An assumption we can make is that backcountry tourers are more educated than off-pist skiers that might not check the announced danger level before going out. We did a statistical study over those two populations to find out wether there is a significant difference in mean of danger exposition.

To make our study meaningful, we did a matching on the two populations with propensity score to avoid comparing a group of 14 alpinists tackling the Jungfrau summit (4'158 m) in July '17 with 2 people going offpist at 1500m elevation in January. We want the two groups to be exposed to the same environmental conditions but differenciate only by their danger judgement. We found that backcountry touring deadly accidents happens at __2.56__ danger level while off-pist accidents happens at __2.86__ on average (with a significant difference, p=0.002371). We showed that educated skiers tend to expose themselves to less dangerous situations. You can check out our statistical analysis in details in this [iPython notebook](https://nbviewer.jupyter.org/github/swiss-avalanches/swiss-avalanches.github.io/blob/master/notebooks/data_story.ipynb).

The avalanche cases that make it to the front page of the news mostly report deaths, one might ask about the accidents that are not fatal.

<div class="container-fluid"> <!-- If Needed Left and Right Padding in 'md' and 'lg' screen means use container class -->
    <div class="row">
        <div class="col-xs-9 col-sm-9 col-md-9 col-lg-9" id="plot"></div>
        <div class="col-xs-3 col-sm-3 col-md-3 col-lg-3" id="legend-plot">
        </div>
    </div>
</div>

We can observe that two to three people on average are caught per avalanche accident. And more than one out of those does not survive. Once again, decision-making from the skiers has a large influence of their destiny. The consequences of an avalanche can be catastrophic for a simple day of ski: as we are right in the winter season, think of our project during you vacation and please be safe.

You will be able to *play* with the data in [EXPLORE](../explore/) tab.
