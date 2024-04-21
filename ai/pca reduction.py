
import numpy as np
from sklearn.decomposition import PCA
import pandas as pd

# Load the data from category3.csv
data = pd.read_csv("D:\\桌面\\comp208\\Recommend_By_Canopy-K-means-main\\Recommend_By_Canopy-K-means-main\\catagory3.csv")  # Update with the actual path

# Select columns from 'sum' to the last column for PCA
points = data.loc[:, 'sum':]

# Convert DataFrame to numpy array
points_array = points.values

# PCA transformation
pca = PCA(n_components=2)
newPoints = pca.fit_transform(points_array)

# Create a DataFrame from the PCA results, directly applying column names and scaling
# zuobiao = pd.DataFrame(newPoints, columns=['x', 'y'])
# zuobiao['x'] = zuobiao['x'] * 1000  # Scale the x coordinate by 1000
# zuobiao['y'] = zuobiao['y'] * 1000  # Scale the y coordinate by 1000
# Create a DataFrame from the PCA results
zuobiao = pd.DataFrame(newPoints, columns=['x_original', 'y_original'])

# Add scaled coordinates by multiplying by 1000
zuobiao['x_scaled'] = zuobiao['x_original'] * 1000
zuobiao['y_scaled'] = zuobiao['y_original'] * 1000

# Print and save the PCA results
print("前两维的贡献率分别为：", pca.explained_variance_ratio_)
#zuobiao = pd.DataFrame(newPoints)
zuobiao.to_csv("D:\\桌面\\comp208\\Recommend_By_Canopy-K-means-main\\Recommend_By_Canopy-K-means-main\\pca_point3.csv", index=False, encoding='utf-8')  # Update with the actual path
