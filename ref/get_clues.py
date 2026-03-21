import csv

def is_white(grid, r, c):
    """Check if a cell is within bounds and is a white square ('1')."""
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return False
    return str(grid[r][c]).strip() == '1'

def get_length(grid, r, c, direction):
    """Count contiguous white squares in the given direction."""
    length = 0
    if direction == 'across':
        while is_white(grid, r, c + length):
            length += 1
    elif direction == 'down':
        while is_white(grid, r + length, c):
            length += 1
    return length

def compute_clue_numbers(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        grid = list(reader)

    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0

    clues = []
    clue_counter = 1

    for r in range(rows):
        for c in range(cols):
            if not is_white(grid, r, c):
                continue
            
            # Start of an across word
            starts_across = not is_white(grid, r, c - 1) and \
                            is_white(grid, r, c + 1) and \
                            is_white(grid, r, c + 2)

            # Start of a down word
            starts_down = not is_white(grid, r - 1, c) and \
                          is_white(grid, r + 1, c) and \
                          is_white(grid, r + 2, c)
            
            if starts_across or starts_down:
                if starts_across:
                    clues.append({
                        'clue_number': clue_counter,
                        'across_or_down': 'across',
                        'row_number': r + 1,
                        'column_number': c + 1,
                        'length': get_length(grid, r, c, 'across')
                    })
                if starts_down:
                    clues.append({
                        'clue_number': clue_counter,
                        'across_or_down': 'down',
                        'row_number': r + 1,
                        'column_number': c + 1,
                        'length': get_length(grid, r, c, 'down')
                    })
                clue_counter += 1

    clues.sort(key=lambda x: (x['across_or_down'], x['clue_number']))

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['clue_number', 'across_or_down', 'row_number', 'column_number', 'length']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(clues)
        
    print(f"Clues generated successfully. Saved to {output_file}")

if __name__ == '__main__':
    INPUT_CSV = 'grid_layout.csv'
    OUTPUT_CSV = 'clue_positions.csv'
    
    compute_clue_numbers(INPUT_CSV, OUTPUT_CSV)