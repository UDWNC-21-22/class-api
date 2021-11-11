import os


msg = input("Enter message commit: ")
os.system("git config user.name ngdkhoi")
os.system("git config user.email ngdkhoi27600@gmail.com")
os.system("git add .")
os.system("""git commit -m " """+msg+""" " """)
os.system("git push origin dev")