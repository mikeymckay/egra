watch( '.html$') {|match_data|
  `couchapp push` unless match_data[0] =~ /\.sw.$/
}
watch( '(.*\.coffee$)' ) {|match_data|
  puts match_data[0]
  result = `coffee --bare --compile #{match_data[0]} 2>&1`
  error = false
  result.each{|line|
    if line.match(/In /)  then
      error = true
      puts line
      `mplayer -really-quiet "/home/crazy/Old Home Folders/crazy/src/GPRS_Easy_Connect_301/data/share/gprsec/sounds/error.wav"`
      `notify-send "#{line}"`
    end
  }
  if not error
    puts "Success!"
    `make combined`
    `couchapp push`
  end

}
