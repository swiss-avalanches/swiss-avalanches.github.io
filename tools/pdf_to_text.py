import sys
from subprocess import call
import os

"""
Transform all pdf files in input text file to text, keep the same names
and add a txt_extracted directory

Requirement: install xpdf on Mac for pdftotext command to work

To generate the list of pdf files to be transcripted we used
`ls data/slf/**/nb/**/*_fr_*.pdf > pdf_to_convert_text`
and then used `pdf_to_convert_text` as first argument to this script.
"""

pdf_files = sys.argv[1]
with open(pdf_files, 'r') as f:
    for file in f.readlines():
        input_file = file.strip()
        directory, filename = os.path.split(input_file)
        basename, _ = os.path.splitext(filename)
        output_directory =  os.path.normpath(os.path.join(directory, '../txt_extracted/'))
        output_file = os.path.join(output_directory, basename + '.txt')
        print("Extracting {} to {}".format(input_file, output_file))
        call(["mkdir", "-p", output_directory])
        call(["pdftotext", input_file, output_file])
