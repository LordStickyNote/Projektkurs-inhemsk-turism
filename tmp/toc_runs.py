from zipfile import ZipFile
from lxml import etree

path = r"C:\Users\Saman\OneDrive\Skrivbord\Projektkurs-inhemsk-turism-github\output\Rapport 2B - slutversion.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
with ZipFile(path) as z:
    root = etree.fromstring(z.read("word/document.xml"))
sdt = next(s for s in root.xpath(".//w:sdt", namespaces=NS) if "Inledning" in "".join(s.xpath(".//w:t/text()", namespaces=NS)))
for p in sdt.xpath(".//w:p", namespaces=NS):
    txt = "".join(p.xpath(".//w:t/text()", namespaces=NS))
    if any(x in txt for x in ("4.4", "5.7", "Bilaga B", "Bilaga C")):
        print("P", repr(txt))
        for e in p.xpath(".//w:r/*", namespaces=NS):
            print(" ", etree.QName(e).localname, repr(e.text), dict(e.attrib))
