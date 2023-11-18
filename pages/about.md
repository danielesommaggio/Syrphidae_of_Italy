---
layout: blank
---
<GalleryCarousel :depiction-id= "[]" height="500px">
  <div class="flex flex-col justify-center items-center w-full h-full bg-black bg-opacity-25 text-white gap-4 px-4 box-border">
    <span class="text-4xl font-medium">{{ app:project_name }}</span>
    <p class="text-lg sm:text-xl">A comprehensive database for the world fauna of Darwin wasps</p>
    <div class="mx-auto flex flex-col items-center mt-6 sm:mt-10 w-full ">
      <autocomplete-otu class="w-full sm:w-96 text-base-content ml-2 sm:ml-0" placeholder="Search by taxon name" autofocus/>
    </em>
    </div>
  </div>
</GalleryCarousel>    

<div class="container mx-auto my-8 px-4 md:px-0 box-border">
 
# {{frontmatter.title}}

## Dig deeper
Please contact us if you need extended access to the data underlying here. The TaxonWorks interfaces used to curate these data include wide range of additional filtering, reporting, and curatorial functionality. With a little training from us we'd be happy to provide you access to this additional functionality. Over time we expect this site to gradually mirror that extended functionality.

## Contact
If you have a question, want to report new data relevant to the project, or have error our preferred means of contact is to file an issue on our [project tracker](https://github.com/our/project/tracker). You can also [chat live with us](https://slackservername). We can also be reached via [email](mailto:{{frontmatter.contact_email}}).   

## Team
 _Please contact us if you would like to join this effort._

Made possible by the wonderful:
* Gandalf - Technical lead
* Aragorn - Outside advisor 
* Frodo - Lead curator
* Samwise - Emotional support

## Citing
* This website - {{frontmatter.citation}}
* Individual taxon pages - See citation at the bottom of each page.  

## Data
Data for these pages is collaboratively curated online in a [TaxonWorks](https://taxonworks) project. All data behind this site served as JSON through calls to a [TaxonWorks API](https://api.taxonworks.org). You can follow along by using the Console of your browser to explore the Network tab. 

## Technical
Want to create your own site? This website is built completely on open-source software. There is a [site template](https://github.com/SpeciesFileGroup/<something>) with more information. Data are curated in a [TaxonWorks](https://taxonworks.org) project then shared via a [TaxonWorks API](https://api.taxonworks.org). Come [chat](https://gitter.im/SpeciesFileGroup/taxonworks) with the TaxonWorks community at any time.

## Copyright
_{{frontmatter.copyright}}_
