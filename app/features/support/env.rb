require 'rubygems' 
require 'capybara' 
require 'capybara/cucumber' 
require 'capybara/webkit' 
require 'test/unit' 
include Test::Unit::Assertions
require 'headless'

Capybara.run_server = false 
Capybara.app_host = 'http://localhost/' 
if ENV['NOHEADLESS']
  Capybara.javascript_driver = :selenium
else
  Capybara.javascript_driver = :webkit
end
#Capybara.default_driver = :selenium
Capybara.ignore_hidden_elements = true
Capybara.default_wait_time = 2000


ENV['NOHEADLESS'] = 'true' 
unless ENV['NOHEADLESS'] == 'true' 
  require 'headless'

  headless = Headless.new
  headless.start

  at_exit do
    headless.destroy
  end
end
