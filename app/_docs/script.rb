Dir.glob("*English*").each do |file|
  `cp #{file} #{file.gsub(/English/,"Kiswahili")}`
end
