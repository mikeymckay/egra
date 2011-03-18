watch( '.html$') {|match_data|
  `couchapp push` unless match_data[0] =~ /\.sw.$/
}
watch( '(.*\.coffee$)' ) {|match_data|
  puts match_data[0]
  `coffee --bare --compile #{match_data[0]}`
  #`coffee --bare --compile #{match_data[0]} 2>&1 | /home/crazy/coffee-notify.sh`
  `couchapp push`
}
