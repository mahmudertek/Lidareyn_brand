
import pandas as pd

try:
    df = pd.read_excel(r"c:\Users\pc\Desktop\Beta_Katalog_FINAL.xlsx", nrows=5)
    print(df.columns)
    print(df.head())
except Exception as e:
    print(e)
