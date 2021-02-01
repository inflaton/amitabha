#!/usr/bin/env ruby

require 'nokogiri'

def process_file(module_html, module_id, module_index)
    array = module_html.split('/')
    class_name = array[array.length - 2] + "_" + array[array.length - 1]

    csv = File.open("./csv/#{class_name}_submodules.csv", 'w')
    csv.puts "index,name,url,moduleId"

    doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

    module_csv = File.open("./csv/modules.csv", 'w')
    module_url = module_html.gsub('pages/', '')
    module_csv.puts "objectId,name,url,index"
    module_csv.puts "#{module_id},#{doc.title},#{module_url},#{module_index}"

    i = 1

    doc.css('h1').each do |h1|
        href = h1.parent['href']
        puts "Processing #{h1.text} #{href} ..."
        csv.puts "#{i},#{h1.text},#{href},#{module_id}"

        i += 1
    end
 
  nil
end

def main
    module_html = ARGV[0]
    module_id = ARGV[1]
    module_index = ARGV[2]

    process_file(module_html, module_id, module_index)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} module_html module_id module_index

  EOU

  abort usage if ARGV.length < 3

  main

end
#./create_module.rb ../pages/dzfs/04.html nCCAkgxyN6 8