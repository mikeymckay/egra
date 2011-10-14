require 'rubygems' 
require 'capybara' 
require 'capybara/cucumber' 
require 'capybara/webkit' 
require 'test/unit' 
include Test::Unit::Assertions

Capybara.run_server = false 
Capybara.app_host = 'http://localhost/' 
Capybara.current_driver = :webkit
#Capybara.javascript_driver = :webkit_debug
Capybara.ignore_hidden_elements = true
Capybara.default_wait_time = 2000
