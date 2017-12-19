---
layout: page
title: Avalanche data story
subtitle: They say it's risky, should I go ?
use-site-title: true
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

![image](../img/images_data_story/dessin_to_graph.jpg)

We can observe that the most deadly levels are 2 and 3. An explanation to that phenomenon is that low levels of danger (1 TODO DOT) is often synonym of a lower amount snow and a high level (4 or 5 TODO DOT) repels skiers to expose themselves to hazard. These are outlier situations that will be excluded from our further analysis.

Backcountry tourers tend to be more experienced than off-pist skiers, is there an explanation to why most qualified alpinists are more easily caught and die under a level 2 of danger?

An assumption we can make is that backcountry tourers are more educated than off-pist skiers that might not check the announced danger level before going out. We did a statistical study over those two populations to find out wether there is a significant difference in mean of danger exposition.

To make our study meaningful, we did a matching on the two populations with propensity score to avoid comparing a 5 experienced alpinist tackling the Youngfraz (4000m) in June, compared to 2 people going offpist at 1500m elevation. The goal of this experiment is to build a comparison between two consistent groups. A naive approach would be to consider off-pist skiing as being safer than backcountry touring, but if you take a look at the proportions, there are more registered accidents of backcountry touring as more people practicing it get caught. Moreover, backcountry tourers tend not to go out when the danger level gets high (3 or more) which explains the fact that it appears that lots of accidents happen at level 2. For more information, a statistical analysis is available on this [ipython notebook](https://nbviewer.jupyter.org/github/swiss-avalanches/swiss-avalanches.github.io/blob/master/notebooks/data_story.ipynb).

The avalanche cases that make it to the front page of the news mostly report deaths, one might ask about the accidents that are not fatal. 



![image](../img/images_data_story/legend.gif)

![image](../img/images_data_story/survival_rates.gif)





We can observe that two to three people on average are caught per avalanche accident. And more than one out of those does not survive. Once again, decision-making from the skiers has a large influence of their destiny. The consequences of an avalanche can be catastrophic for a simple day of ski: as we are right in the winter season, think of our project during you vacation and please be safe.

You will be able to *play* with the data under [**EXPLORE**](../explore/).



