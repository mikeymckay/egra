
VER = $(shell cat version.txt)
SED_VER = sed "s/@VERSION/${VER}/"

DIR = _attachments/combined-javascript/
NAME = egra
MAX = ${DIR}/${NAME}.js
MIN = ${DIR}/${NAME}.min.js
#CSS = ${NAME}.css
#CSSMIN = ${NAME}.min.css

FILES = _attachments/js-libraries/jquery-1.6.2.min.js \
  _attachments/js-libraries/mustache.js \
  _attachments/js-libraries/handlebars.js \
  _attachments/js-libraries/inflection.js \
  _attachments/js-libraries/mustache.js \
  _attachments/models/template.js \
  _attachments/models/assessment.js \
  _attachments/models/jqueryMobilePage.js \
  _attachments/models/scorer.js \
  _attachments/models/timer.js \
  _attachments/egra.js \
  _attachments/js-libraries/jquery-mobile/jquery.mobile-1.0b2.min.js

#CSSFILES =  themes/default/jquery.mobile.theme.css \
  themes/default/jquery.mobile.core.css \
  themes/default/jquery.mobile.transitions.css \
  themes/default/jquery.mobile.grids.css \
  themes/default/jquery.mobile.headerfooter.css \
  themes/default/jquery.mobile.navbar.css \
  themes/default/jquery.mobile.button.css \
  themes/default/jquery.mobile.collapsible.css \
  themes/default/jquery.mobile.controlgroup.css \
  themes/default/jquery.mobile.dialog.css \
  themes/default/jquery.mobile.forms.checkboxradio.css \
  themes/default/jquery.mobile.forms.fieldcontain.css \
  themes/default/jquery.mobile.forms.select.css \
  themes/default/jquery.mobile.forms.textinput.css \
  themes/default/jquery.mobile.listview.css \
  themes/default/jquery.mobile.forms.slider.css

all: combined min css cssmin

clean:
	@@rm -rf ${DIR}*

#css:
#	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${CSS}
#	@@cat ${CSSFILES} >> ${CSS}

#cssmin: css
#	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${CSSMIN}
#	@@java -jar build/yuicompressor-2.4.4.jar --type css ${CSS} >> ${CSSMIN}

combined:
	@@cat ${FILES} > ${MAX}

min: combined
	@@java -jar scripts/google-compiler-20100917.jar --js ${MAX} --warning_level QUIET --js_output_file ${MIN}.tmp
	@@cat ${MIN}.tmp > ${MIN}
	@@rm -f ${MIN}.tmp

#zip: clean min cssmin
#	@@mkdir -p ${DIR}
#	@@cp ${DIR}*.js ${DIR}/
#	@@cp ${DIR}*.css ${DIR}/
#	@@cp -R themes/default/images ${DIR}/
#	@@zip -r ${DIR}.zip ${DIR}
#
## Used by the jQuery team to deploy a build to the CDN
#deploy: zip
#	# Deploy to CDN
#	@@mv ${DIR} ${VER}
#	@@cp ${DIR}.zip ${VER}/
#	@@scp -r ${VER} jqadmin@code.origin.jquery.com:/var/www/html/code.jquery.com/mobile/
#	@@mv ${VER} ${DIR}
#
#	# Deploy Demos
#	@@mkdir -p ${VER}
#	@@cp -r index.html themes experiments docs ${VER}/
#
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../../../js|src="js|g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../../js|src="js|g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../js|src="js|g' {} \;
#
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|media="only all"||g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../../../|rel="stylesheet"  href="|g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../../|rel="stylesheet"  href="|g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../|rel="stylesheet"  href="|g' {} \;
#
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|href="themes/default/"|href="http://code.jquery.com/mobile/${VER}/${DIR}.min.css"|g' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="js/jquery.js"|src="http://code.jquery.com/jquery-1.5.min.js"|' {} \;
#	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="js/"|src="http://code.jquery.com/mobile/${VER}/${DIR}.min.js"|g' {} \;
#
#	@@scp -r ${VER} jqadmin@jquerymobile.com:/srv/jquerymobile.com/htdocs/demos/
