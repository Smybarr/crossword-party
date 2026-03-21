import csv
import json

def generate_answer_key(positions_csv, clues_json, output_json):
    # Load clue positions from corrected grid
    positions = {}
    with open(positions_csv, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            key = (int(row['clue_number']), row['across_or_down'].lower())
            positions[key] = {
                'row': int(row['row_number']),
                'col': int(row['column_number']),
                'length': int(row['length']),
            }

    # Load clue text from corrected DB
    with open(clues_json, 'r', encoding='utf-8') as f:
        clues_db = json.load(f)

    answer_key = []
    matched = 0
    unmatched = []

    for clue in clues_db:
        number = int(clue['number'])
        direction = clue['direction'].lower()
        key = (number, direction)

        entry = {
            'number': number,
            'direction': clue['direction'],
            'text': clue['text'],
            'page': clue['page'],
        }

        if key in positions:
            entry['row'] = positions[key]['row']
            entry['col'] = positions[key]['col']
            entry['length'] = positions[key]['length']
            matched += 1
        else:
            entry['row'] = None
            entry['col'] = None
            entry['length'] = None
            unmatched.append(f"{number} {clue['direction']}")

        answer_key.append(entry)

    answer_key.sort(key=lambda x: (x['direction'], x['number']))

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(answer_key, f, indent=2)

    print(f"Answer key generated: {len(answer_key)} clues")
    print(f"  Matched to grid: {matched}")
    print(f"  Unmatched: {len(unmatched)}")
    if unmatched:
        for u in unmatched:
            print(f"    {u}")

if __name__ == '__main__':
    generate_answer_key('clue_positions.csv', 'clues_db_corrected.json', 'answer_key.json')
