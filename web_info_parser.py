import csv
import sys
import json
import re

def parse_read_info(read_info):
	assert(len(read_info) <= 3)
	onyomi = ', '.join(read_info['On\'yomi']) if 'On\'yomi' in read_info else ''
	kunyomi = ', '.join(read_info['Kun\'yomi']) if 'Kun\'yomi' in read_info else ''
	nanori = ', '.join(read_info['Nanori']) if 'Nanori' in read_info else ''

	return onyomi, kunyomi, nanori

def parse_compounds_info(compounds_info):
	compounds = []
	for compound_entry in compounds_info:
		assert(len(compound_entry) == 3)
		compounds.append('{} ({}): {}'.format(
			compound_entry['compound'],
			compound_entry['reading'].strip(),
			compound_entry['meaning']
		));

	return '<br>'.join(compounds)

def parse_misc_info(misc_info):
	# assert(len(misc_info) == 3)
	grade = ''
	frequency = ''
	for info in misc_info:
		grade_match = re.match(r'^Taught in grade ([0-9])$', info)
		if grade_match:
			assert(not grade)
			grade = grade_match.group(1)
		frequency_match = re.match(r'^Frequency: ([0-9]+)$', info)
		if frequency_match:
			assert(not frequency)
			frequency = frequency_match.group(1)

	return grade, frequency

with open(sys.argv[1], encoding='utf-8', newline='') as inputcsv:
	with open(sys.argv[2], 'w', encoding='utf-8', newline='') as outputcsv:
		csvreader = csv.reader(inputcsv)
		csvwriter = csv.writer(outputcsv)

		for row in csvreader:
			web_data = json.loads(row.pop())

			# kanji = row[0] # DEBUG
			# print(kanji) # DEBUG
			# print(row) # DEBUG

			assert(len(web_data) == 4)

			reading_info = parse_read_info(web_data['Reading']) # tuple
			meaning_info = web_data['Meaning'] # string
			compounds_info = parse_compounds_info(web_data['Compounds']) # string
			misc_info = parse_misc_info(web_data['Miscellaneous']) # tuple

			# kanji, traditional chinese, simplified chinese, entry_type, entry_type_str,
			# onyomi, kunyomi, nanori, meaning, compounds, grade, frequency
			csvwriter.writerow(row + list(reading_info) +
				[meaning_info, compounds_info] + list(misc_info))
