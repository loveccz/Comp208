import pandas as pd
import numpy as np

# Load the processed Excel file with all sheets
xlsx_file = 'D:\\桌面\\comp208\\Recommend_By_Canopy-K-means-main\\Recommend_By_Canopy-K-means-main\\Processed_100个.xlsx'  # Replace this with the actual path to your Excel file
all_sheets_dict = pd.read_excel(xlsx_file, sheet_name=None)  # Load all sheets
data = pd.concat(all_sheets_dict.values(), ignore_index=True)  # Concatenate all sheets into one DataFrame

# Dictionary for the new tags from the Excel data
tag_dic = {tag: idx for idx, tag in enumerate(['War', 'Freedom', 'History', 'Adventure', 'Society', 'Romantic', 'Tragedy', 'Fantasy', 'Philosophy', 'Psychology'], start=0)}

# Initialize a matrix to count occurrences of each tag for each user
user_tag_list = np.zeros((data['user_id'].nunique(), len(tag_dic)))

# Iterate over the DataFrame to fill the matrix
for _, row in data.iterrows():
    user_index = int(row['user_id']) - 1  # assuming user_id starts from 1
    for tag in ['Tag 1', 'Tag 2', 'Tag 3']:
        if row[tag] in tag_dic:
            user_tag_list[user_index][tag_dic[row[tag]]] += 1

# Convert matrix to DataFrame for better readability and save
tag_names = list(tag_dic.keys())
user_tag_df = pd.DataFrame(user_tag_list, columns=tag_names)
# Calculate the total counts per user (sum across each row)
user_tag_df['sum'] = user_tag_df.sum(axis=1)

# Calculate proportion for each tag
for tag in tag_names:
    user_tag_df[f'{tag}.1'] = user_tag_df[tag] / user_tag_df['sum']
user_tag_df.to_csv('D:\\桌面\\comp208\\Recommend_By_Canopy-K-means-main\\Recommend_By_Canopy-K-means-main\\catagory3.csv', index=False, encoding='utf-8-sig')
