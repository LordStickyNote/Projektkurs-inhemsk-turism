from zipfile import ZipFile
from lxml import etree

path = r"C:\Users\Saman\OneDrive\Skrivbord\Projektkurs-inhemsk-turism-github\output\Rapport 2B - slutversion.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
with ZipFile(path) as z:
    root = etree.fromstring(z.read("word/document.xml"))
for i, sdt in enumerate(root.xpath(".//w:sdt", namespaces=NS)):
    text = "".join(sdt.xpath(".//w:t/text()", namespaces=NS))
    if "Inledning" in text or "TOC" in text:
        print("SDT", i, text[:4000])
        for p in sdt.xpath(".//w:p", namespaces=NS):
            t = "".join(p.xpath(".//w:t/text()", namespaces=NS))
            if t.strip():
                style = p.xpath("./w:pPr/w:pStyle/@w:val", namespaces=NS)
                print(style, repr(t))
