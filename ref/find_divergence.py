import csv
import json

def find_all_discrepancies(csv_file, json_file):
    csv_clues = set()
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            csv_clues.add((row['across_or_down'].lower(), int(row['clue_number'])))
    
    json_clues = set()
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        for item in data:
            json_clues.add((item['direction'].lower(), int(item['number'])))

    # Find the differences between the two sets
    in_csv_only = sorted(list(csv_clues - json_clues), key=lambda x: (x[0], x[1]))
    in_json_only = sorted(list(json_clues - csv_clues), key=lambda x: (x[0], x[1]))

    if not in_csv_only and not in_json_only:
        print("No discrepancies found. Both files match perfectly.")
        return

    if in_csv_only:
        print("Clues in CSV but missing in JSON:")
        for direction, number in in_csv_only:
            print(f"  {number} {direction}")
            
    if in_json_only:
        print("\nClues in JSON but missing in CSV:")
        for direction, number in in_json_only:
            print(f"  {number} {direction}")

if __name__ == '__main__':
    # Replace these filenames if necessary
    CSV_FILENAME = 'clue_positions.csv'
    JSON_FILENAME = 'clues_db_corrected.json'
    
    find_all_discrepancies(CSV_FILENAME, JSON_FILENAME)