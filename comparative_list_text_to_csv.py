from enum import Enum
import re
import csv
import sys

class EntryType(Enum):
	ANN = 0 # native to Japanese
	AAA = 1 # kanji = traditional = simplified
	AAB = 2 # kanji = traditional != simplified
	ABA = 3 # kanji = simplified != traditional
	ABB = 4 # kanji != traditional = simplified
	ABC = 5 # all different

# arguments: [input filename], [output filename]
with open(sys.argv[1], 'rb') as file:
	with open(sys.argv[2], 'w', encoding='utf-8', newline='') as csvfile: # TODO open as csv
		# csv header: kanji, traditional_char, simplified_char, entry_type, entry_type_str
		csvwriter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

		for line in file:
			line = line.rstrip().decode('utf-8')

			# set the variables: char_j, char_t, char_s, and entry_type
			if (m := re.match(r'^[0-9]{4} (.) — —$', line)) is not None:
				char_j = m.group(1)
				char_t = ''
				char_s = ''
				entry_type = EntryType.ANN
			elif (m := re.match(r'^[0-9]{4} (.) " "$', line)) is not None:
				char_j = m.group(1)
				char_t = char_j
				char_s = char_j
				entry_type = EntryType.AAA
			elif (m := re.match(r'^[0-9]{4} (.) " (.)$', line)) is not None:
				char_j = m.group(1)
				char_t = char_j
				char_s = m.group(2)
				entry_type = EntryType.AAB
			elif (m := re.match(r'^[0-9]{4} (.) (.) "$', line)) is not None:
				char_j = m.group(1)
				char_t = m.group(2)
				char_s = char_j
				entry_type = EntryType.ABA
			elif (m := re.match(r'^[0-9]{4} (.) (.)$', line)) is not None:
				char_j = m.group(1)
				char_t = m.group(2)
				char_s = char_t
				entry_type = EntryType.ABB
			elif (m := re.match(r'^[0-9]{4} (.) (.) (.)$', line)) is not None:
				char_j = m.group(1)
				char_t = m.group(2)
				char_s = m.group(3)
				entry_type = EntryType.ABC
			else:
				print("ERROR (unexpected line): " + line)
				sys.exit()

			# save the values as an entry
			csvwriter.writerow([char_j, char_t, char_s, entry_type.value, entry_type.name])
