import csv
import json

def csv_to_json(csv_file, json_file):
    """
    Convert CSV file to JSON format
    
    Args:
        csv_file: Path to input CSV file
        json_file: Path to output JSON file
    """
    data = []
    
    # Read CSV file
    print(f"Reading CSV file: {csv_file}")
    with open(csv_file, 'r', encoding='utf-8') as csvf:
        csv_reader = csv.DictReader(csvf)
        
        # Convert each row to dictionary and add to data list
        for i, row in enumerate(csv_reader, 1):
            data.append(row)
            if i % 10000 == 0:
                print(f"Processed {i} rows...")
    
    print(f"Total rows processed: {len(data)}")
    
    # Write to JSON file
    print(f"Writing to JSON file: {json_file}")
    with open(json_file, 'w', encoding='utf-8') as jsonf:
        json.dump(data, jsonf, indent=2, ensure_ascii=False)
    
    print("Conversion completed successfully!")

if __name__ == "__main__":
    csv_file = "4_7.csv"
    json_file = "4_7.json"
    
    csv_to_json(csv_file, json_file)
